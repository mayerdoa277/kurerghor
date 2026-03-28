// Simple placeholder image generator
// This will be served as a static file, but we'll use a data URL approach

export default function handler(req, res) {
  const { width = 300, height = 300 } = req.query;
  
  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        ${width}x${height}
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;
  
  // Redirect to a data URL or return the SVG directly
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
}
