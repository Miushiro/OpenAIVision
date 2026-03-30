import { useState } from 'react';
import { Upload, Button, Typography, Image, message, Spin, Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const DocumentUpload : React.FC = () => {
    	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string>('');
	const [result, setResult] = useState<string>('');
	const [loading, setLoading] = useState(false);

	const handleUpload = async () => {
		if (!file) {
			message.warning('Please select an image');
			return;
		}

		const formData = new FormData();
		formData.append('image', file);

		try {
			setLoading(true);
			setResult('');

			const res = await fetch('http://localhost:3000/api/OpenAIVision', {
				method: 'POST',
				body: formData
			});

			const text = await res.text();
			setResult(text);
		} catch (err) {
			console.error(err);
			message.error('Upload failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='container mx-auto p-4 jsutify-center items-center flex flex-col gap-8'>
			<Typography.Title level={3}>Image OCR Upload</Typography.Title>

			<Card className='flex flex-col gap-4 justify-center bg-card	max-w-md'>
				<p>Upload an image (JPEG or PNG) to extract text.</p>
				<div className='flex flex-col gap-4 mt-8'>
					<Upload.Dragger
						beforeUpload={(file: File) => {
							setFile(file);
							setPreview(URL.createObjectURL(file));
							return false;
						}}
						maxCount={1}
						accept="image/png,image/jpeg"
						showUploadList={false}
						style={{
							borderRadius: 12,
							padding: 20
						}}
					>
					{preview ? (
						<div className="flex flex-col items-center gap-2">
							<Image
								src={preview}
								alt="preview"
								style={{ maxHeight: 200, objectFit: 'contain' }}
								preview={false}
							/>
							<Typography.Text type="secondary">Click or drag to replace image</Typography.Text>
						</div>
					) : (
						<div className="flex flex-col items-center gap-2">
							<InboxOutlined style={{ fontSize: 40, color: '#888' }} />
							<Typography.Text strong>Click or drag image to upload</Typography.Text>
							<Typography.Text type="secondary">PNG or JPG (max 5MB)</Typography.Text>
						</div>
					)}
					</Upload.Dragger>
					<div className="flex justify-center">
						<Button
							type="primary"
							onClick={handleUpload}
							loading={loading}
							className=''
							disabled={!file}
						>
							Upload
						</Button>
					</div>
				</div>
			</Card>
			{preview && (
				<div>
					<p>Preview:</p>
					<Image src={preview} width={300} />
				</div>
			)}
			{loading && <Spin />}
			{result && (
				<div style={{ marginTop: 16 }}>
					<Typography.Title level={4}>Result:</Typography.Title>
					<pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
				</div>
			)}
		</div>
	);
}


export default DocumentUpload;