import html from '../static/index.html';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            });
        } else if (request.method === 'POST' && url.pathname === '/analyze-image') {
            const formData = await request.formData();
			const imageFile = formData.get('image');

			if (!imageFile) {
				return new Response('No image file uploaded', { status: 400 });
			}

			const arrayBuffer = await imageFile.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);

			const input = {
				image: [...uint8Array],
				prompt: "You are an astrologer. Based on this person's aura, predict their astrology sign and give a short prediction for how their week will go.",
				max_tokens: 512,
			};

			try {
				const response = await env.AI.run(
					"@cf/llava-hf/llava-1.5-7b-hf",
					input
				);

				return new Response(JSON.stringify({ analysis: response['description'] }), {
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				return new Response('Error analyzing image: ' + error.message, { status: 500 });
			}
		}
	}
}