import mongoose from 'mongoose'
import C from '#shared/constants.js'

const PostSchema = new mongoose.Schema({
  title: {
    type    : String,
    required: true,
    trim: true,
    minlength: 3
  },
  slug: {
    type: String,
    select: false,
    required: true
  },
  tags: {
    type: [String],
    trim: true,
    required: false
  },
  state: {
    type: String,
    enum: Object.keys(C.Post_STATE),
    default: C.POST_STATES.DRAFT,
    select: false,
    required: true
  },
  body: {
    type: String,
    required: true,
    trim: true,
    minlength: 20
  },
  likes: {
    type: Number,
    required: true,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  created: {
    type: Date,
    select: false,
    default: Date.now
  },
  updated: {
    type: Date,
    select: false,
    default: Date.now
  }
})

const Post = mongoose.model('Product', ProductSchema)
export default Product
