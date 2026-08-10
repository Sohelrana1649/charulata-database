import { Router, Request, Response } from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth';
import { AuthenticatedRequest } from '../middlewares/auth';
import { uploadBufferToCloudinary } from '../utils/cloudinary';
import { catchAsync } from '../utils/catchAsync';

// Memory storage for direct buffer upload to Cloudinary
const storage = multer.memoryStorage();

// File filter: only images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed! SVGs are blocked for security.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

const router = Router();

// Protect — authenticated users can upload
router.use(protect);

// Single image upload to Cloudinary
router.post('/image', upload.single('image'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ status: 'fail', message: 'No image file provided.' });
    return;
  }

  // Upload buffer to Cloudinary
  const imageUrl = await uploadBufferToCloudinary(req.file.buffer, 'charulata_uploads');

  res.status(200).json({
    status: 'success',
    data: {
      url: imageUrl,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size
    }
  });
}));

// Multiple images upload to Cloudinary (up to 5)
router.post('/images', upload.array('images', 5), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ status: 'fail', message: 'No image files provided.' });
    return;
  }

  const uploadPromises = files.map(async (file) => {
    const url = await uploadBufferToCloudinary(file.buffer, 'charulata_uploads');
    return {
      url,
      filename: file.originalname,
      originalName: file.originalname,
      size: file.size
    };
  });

  const urls = await Promise.all(uploadPromises);

  res.status(200).json({
    status: 'success',
    data: { images: urls }
  });
}));

// Video file filter & upload config (up to 100MB video)
const videoFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('video/') || ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WebM, MOV, AVI) are allowed!'));
  }
};

const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max video size
  }
});

// Single video upload to Cloudinary
router.post('/video', uploadVideo.single('video'), catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ status: 'fail', message: 'No video file provided.' });
    return;
  }

  // Upload video buffer to Cloudinary
  const videoUrl = await uploadBufferToCloudinary(req.file.buffer, 'charulata_videos');

  res.status(200).json({
    status: 'success',
    data: {
      url: videoUrl,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size
    }
  });
}));

export default router;
