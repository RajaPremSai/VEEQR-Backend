const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

function exportLogsCsv(logs) {
  const fields = [
    '_id', 'logId', 'securityGuardId', 'vehicleNumber', 'timeIn', 'timeOut', 'gateNumber', 'createdAt'
  ];
  const parser = new Parser({ fields });
  return parser.parse(logs.map(l => ({
    ...l,
    timeIn: l.timeIn ? new Date(l.timeIn).toISOString() : '',
    timeOut: l.timeOut ? new Date(l.timeOut).toISOString() : '',
    createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : ''
  })));
}

function exportLogsPdf(logs, stream) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  doc.pipe(stream);

  doc.fontSize(18).text('Vehicle Movement Logs', { align: 'center' });
  doc.moveDown();

  logs.forEach((log) => {
    doc.fontSize(10)
      .text(`LogID: ${log.logId || log._id}`)
      .text(`Vehicle: ${log.vehicleNumber}`, { continued: true })
      .text(`  Gate: ${log.gateNumber}`)
      .text(`Guard: ${log.securityGuardId}`)
      .text(`IN: ${log.timeIn ? new Date(log.timeIn).toLocaleString() : '-'}`, { continued: true })
      .text(`  OUT: ${log.timeOut ? new Date(log.timeOut).toLocaleString() : '-'}`)
      .moveDown();
  });

  doc.end();
}

module.exports = { exportLogsCsv, exportLogsPdf }; 