export function postEventHandler(req, res) {
  res.status(200).json({
    status: 'ok',
    events: 'Zero',
  });
}
