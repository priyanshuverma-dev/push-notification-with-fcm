import { sendPushNotification, throwIfMissing } from './utils.js';

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log, error }: Context) => {
  try {
    throwIfMissing(process.env, [
      'FCM_PROJECT_ID',
      'FCM_PRIVATE_KEY',
      'FCM_CLIENT_EMAIL',
      'FCM_DATABASE_URL',
    ]);
    throwIfMissing(req.body, ['deviceToken', 'message']);
    throwIfMissing(req.body.message, ['title', 'body']);
  } catch (err) {
    error(err);
    if (err instanceof Error) res.json({ ok: false, error: err.message }, 400);
  }

  try {
    log(`Sending message to device: ${req.body}`);
    const response = await sendPushNotification({
      notification: {
        title: req.body.message.title,
        body: req.body.message.body,
      },
      token: req.deviceToken,
    });
    log(`Successfully sent message: ${response}`);

    return res.json({ ok: true, messageId: response });
  } catch (e) {
    error(e);
    return res.json({ ok: false, error: 'Failed to send the message' }, 500);
  }
};
