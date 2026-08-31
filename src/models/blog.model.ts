import { Schema, model, Document, Types } from 'mongoose';

export interface IBlogImage {
  _id?: Types.ObjectId | string;
  url: string;
  publicId?: string;
  caption?: string;
  order: number;
}

export interface IBlog extends Document {
  title: string;
  titleBn?: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentBn?: string;
  coverImage?: string;
  images: IBlogImage[];
  relatedProducts: Types.ObjectId[];
  focusKeyword?: string;
  isFeatured: boolean;
  scheduledAt?: Date;
  previewToken?: string;
  author: string;
  category?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published' | 'scheduled';
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogImageSchema = new Schema<IBlogImage>(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    titleBn: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    contentBn: {
      type: String,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    images: {
      type: [blogImageSchema],
      default: [],
    },
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    focusKeyword: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    previewToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    author: {
      type: String,
      default: 'Charulata Lifestyle',
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'scheduled'],
        message: 'Status must be draft, published, or scheduled',
      },
      default: 'draft',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and text indexes for fast querying & full-text search
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ status: 1, scheduledAt: 1 });
blogSchema.index({ isFeatured: 1, createdAt: -1 });
blogSchema.index({ status: 1, category: 1, createdAt: -1 });
blogSchema.index({ status: 1, tags: 1 });
blogSchema.index(
  {
    title: 'text',
    titleBn: 'text',
    excerpt: 'text',
    content: 'text',
    tags: 'text',
    category: 'text',
    focusKeyword: 'text',
  },
  {
    weights: {
      title: 10,
      titleBn: 8,
      focusKeyword: 6,
      tags: 5,
      category: 4,
      excerpt: 3,
      content: 1,
    },
    name: 'BlogTextIndex',
  }
);

export const Blog = model<IBlog>('Blog', blogSchema);
