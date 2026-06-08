import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/User';
import { VerificationCode } from '../models/VerificationCode';
import { generateToken, AuthRequest, authMiddleware } from '../auth';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email: string, code: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Aacoustix" <noreply@musicapp.com>',
      to: email,
      subject: 'Your Aacoustix verification code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `<div style="font-family:Arial;max-width:480px;margin:0 auto;padding:24px;background:#181818;color:#fff;border-radius:8px">
        <h2 style="color:#1db954;margin-bottom:16px">Aacoustix</h2>
        <p style="margin-bottom:24px">Your verification code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;background:#282828;border-radius:8px;color:#1db954">${code}</div>
        <p style="margin-top:24px;color:#b3b3b3;font-size:13px">This code expires in 10 minutes. If you didn't request this, you can safely ignore it.</p>
      </div>`,
    });
  } catch {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
  }
}

const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${crypto.randomUUID()}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (_req, file, cb) => {
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (imageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${ext}`));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

function passwordStrength(pw: string): string {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score < 2) return 'weak';
  if (score < 4) return 'medium';
  return 'strong';
}

router.post('/send-verification', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email required' });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, error: 'Email already registered' });
      return;
    }
    await VerificationCode.deleteMany({ email: email.toLowerCase(), verified: false });
    const code = generateCode();
    await VerificationCode.create({
      email: email.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendVerificationEmail(email, code);
    res.json({ success: true, data: { message: 'Verification code sent' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/verify-code', async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, error: 'Email and code required' });
      return;
    }
    const record = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      res.status(400).json({ success: false, error: 'Invalid or expired code' });
      return;
    }
    record.verified = true;
    await record.save();
    const verifyToken = generateToken(email.toLowerCase());
    res.json({ success: true, data: { message: 'Email verified', verifyToken } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/google', async (req: AuthRequest, res: Response) => {
  try {
    const { email, displayName, googleId } = req.body;
    if (!email || !displayName || !googleId) {
      res.status(400).json({ success: false, error: 'Email, name, and Google ID required' });
      return;
    }
    let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { googleId }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        email: email.toLowerCase(),
        displayName,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
        googleId,
        isVerified: true,
      });
    }
    const token = generateToken(user.id);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, gender: user.gender, isVerified: user.isVerified },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, confirmPassword, displayName, gender, verifyToken } = req.body;
    if (!email || !password || !displayName || !verifyToken) {
      res.status(400).json({ success: false, error: 'Email, password, display name, and verification required' });
      return;
    }

    const verifiedRecord = await VerificationCode.findOne({
      email: email.toLowerCase(),
      verified: true,
    }).sort({ expiresAt: -1 });

    if (!verifiedRecord) {
      res.status(400).json({ success: false, error: 'Email not verified. Please verify your email first.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }

    if (passwordStrength(password) === 'weak') {
      res.status(400).json({ success: false, error: 'Password too weak — use a mix of upper/lowercase, numbers, and symbols' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, error: 'Passwords do not match' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      displayName,
      gender: gender || undefined,
      passwordHash,
      isVerified: true,
    });

    const token = generateToken(user.id);
    res.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, displayName: user.displayName, gender: user.gender, isVerified: user.isVerified } },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email/phone and password required' });
      return;
    }

    const isEmail = email.includes('@');
    const user = isEmail
      ? await User.findOne({ email: email.toLowerCase() })
      : await User.findOne({ phone: email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, phone: user.phone, displayName: user.displayName, avatarUrl: user.avatarUrl, gender: user.gender },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({
      success: true,
      data: { id: user.id, email: user.email, phone: user.phone, displayName: user.displayName, avatarUrl: user.avatarUrl, gender: user.gender, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/profile', authMiddleware, (req: AuthRequest, res: Response, next) => {
  uploadAvatar.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    next();
  });
}, async (req: AuthRequest, res: Response) => {
  try {
    const { displayName, gender } = req.body;
    const file = req.file;

    const updateData: Record<string, unknown> = {};
    if (displayName?.trim()) updateData.displayName = displayName.trim();
    if (gender) updateData.gender = gender;
    if (file) updateData.avatarUrl = `/uploads/${file.filename}`;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: { id: user.id, email: user.email, phone: user.phone, displayName: user.displayName, avatarUrl: user.avatarUrl, gender: user.gender, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
