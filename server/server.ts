import Elysia, { t } from 'elysia';
import OpenAI from 'openai';
import { ResponseInputImage, ResponseInputText } from 'openai/resources/responses/responses.mjs';
import { rateLimit } from 'elysia-rate-limit';
import logixlysia from 'logixlysia';
import { CheckImageSize_1024p, CreateImageDataURLFromBuffer } from './functions/helper';

const app = new Elysia({prefix: '/api'});

app
    .use(rateLimit({
        duration: 60 * 1000,
        max: 10,
        errorResponse: 'Too many requests, please try again later.'
    }))
    .use(logixlysia({
        config:{
            showStartupMessage: true,
            startupMessageFormat: 'banner',
            useColors: true,
            ip: true,
            timestamp: {
                translateTime: 'yyyy-mm-dd HH:MM:ss'
            },
            service: 'api-server',
            slowThreshold: 500,
            verySlowThreshold: 1000,
            showContextTree: true,
            contextDepth: 2,
            customLogFormat: '{now} {service} {level} {method} {pathname} {duration} {status}',
            logFilePath: 'logs/logixlysia.log',
            logRotation: {
                maxSize: '10m',
                interval: '1d',
                maxFiles: '7d',
                compress: true
            },
            pino: {
                prettyPrint: {
                    colorize: true,
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname'
                }
            }
        }
    }))

app
    .get('/', () => 'Hello World!')
    .post('/OpenAIVision', async ({body, status}) => {
        if(body.image.type !== 'image/jpeg' && body.image.type !== 'image/png') {
            return status(415, 'Unsupported file type. Please upload a JPEG or PNG image.');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: "https://api.cometapi.com/v1"
        });
        const command: ResponseInputText = {
            type: 'input_text',
            text: "Extract transaction fields and document type. Output: Field: value | accuracy%. No extra text."
        }
        const imageContext: ResponseInputImage = {
            type: 'input_image',
            detail: "original",
            image_url: await CreateImageDataURLFromBuffer(await CheckImageSize_1024p(body.image), body.image.type)
        }

        try {
            const response = await openai.responses.create({
                model: 'qwen3.5-plus',
                input: [
                    {
                        role: "user",
                        content: [command, imageContext]
                    }
                ],
                max_output_tokens: 1500
            });
            console.log(response.output_text);
            return response.output_text;
        } catch (error) {
            console.error('Error generating image:', error);
            return { error: 'Failed to generate image' };
        }
    }, {
        body: t.Object({
            image: t.File()
        })
    })


app.listen(3000, () => {console.log('Server is running on http://localhost:3000')})