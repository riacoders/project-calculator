import mongoose, { Schema, Document, models } from 'mongoose'

export interface IFile extends Document {
	name: string
	size: number
	uploadedAt: Date
	amount: number
}

const FileSchema = new Schema<IFile>(
	{
		name: { type: String, required: true },
		size: { type: Number, required: true },
		uploadedAt: {
			type: Date,
			default: () => {
				const date = new Date()
				date.setHours(date.getHours() )
				return date
			},
		},
		amount: { type: Number, required: true, default: 0 },
	},
	{ versionKey: false, timestamps: true }
)

const FileModel = models.File || mongoose.model<IFile>('File', FileSchema)
export default FileModel
