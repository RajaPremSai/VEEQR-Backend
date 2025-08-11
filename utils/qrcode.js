const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generateQrPng(payload, fileName) {
  const qrDir = path.join(__dirname, '..', 'uploads', 'qrcodes');
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const filePath = path.join(qrDir, `${fileName}.png`);
  const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M' });
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  await fs.promises.writeFile(filePath, base64Data, 'base64');
  return `/uploads/qrcodes/${fileName}.png`;
}

module.exports = { generateQrPng }; 