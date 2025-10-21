import mongoose, { Schema, Document } from 'mongoose'

export interface IFile extends Document {
	name: string
	mimeType: string
	size: number
	data: Buffer
	uploadedAt: Date
}

const FileSchema = new Schema<IFile>({
	name: { type: String, required: true },
	mimeType: { type: String, required: true },
	size: { type: Number, required: true },
	data: { type: Buffer, required: true },
	uploadedAt: { type: Date, default: Date.now },
})

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema)
