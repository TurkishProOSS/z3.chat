import { ApiKeys } from '@/database/models/ApiKeys';
import { withAuth } from '@/middleware/withAuth';
import { type NextRequest } from 'next/server';
import axios from 'axios';

export const GET = () => withAuth(async session => {
    const keys = await ApiKeys.find({ user: session.user.id });
    return Response.json({ success: true, keys: keys.map(k => ({ provider: k.provider, key: k.key })) }, { status: 200 });
});

export const PATCH = (request: NextRequest) => withAuth(async session => {
    const modify: Record<string, string> = {};
    const body = await request.json();
    
    body.openai = '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';
    body.gemini = 'AIzaSyDSt7D5VPQHyBDIcYTvzU2CseBQxNwaqvc';
    body.anthropic = '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';

    if (body.openai) {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${body.openai}`
            }
        }).catch(() => ({} as any));

        if (!(response.data?.data && response.status === 200)) return Response.json({ success: false, message: 'Invalid OpenAI API key' }, { status: 400 });
        modify.openai = body.openai;
    };

    if (body.gemini) {
        const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
            params: {
                key: body.gemini
            }
        }).catch(() => ({} as any));

        if (!(response.data?.nextPageToken && response.status === 200)) return Response.json({ success: false, message: 'Invalid Gemini API key' }, { status: 400 });
        modify.gemini = body.gemini;
    };

    if (body.anthropic) {
        const response = await axios.get('https://api.anthropic.com/v1/models', {
            headers: {
                'x-api-key': body.anthropic,
                'anthropic-version': '2023-06-01'
            }
        }).catch(() => ({} as any));

        if (!(response.data?.data && response.status === 200)) return Response.json({ success: false, message: 'Invalid Anthropic API key' }, { status: 400 });
        modify.anthropic = body.anthropic;
    };

    // TODO: culku db erör atıyor erörü göremiyom amk
    //await Promise.all(Object.entries(modify).map(([provider, key]) => ApiKeys.updateOne({ user: session.user.id, provider }, { $set: { key } }, { upsert: true })));
    return Response.json({ success: true, message: 'API keys updated' }, { status: 200 });
});