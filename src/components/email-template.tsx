interface EmailTemplateProps {
  username: string;
}

interface VerificationEmailProps extends EmailTemplateProps {
  code: string;
}

interface NotificationEmailProps extends EmailTemplateProps {
  message: string;
}

export const VerificationTemplate: React.FC<Readonly<VerificationEmailProps>> = ({
  username,
  code
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
    <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>Hi, {username}!</h1>
    </div>
    <div style={{ padding: '20px', color: '#555' }}>
      <p>Thank you for joining our community. To verify your email address, please click the link below:</p>
      <div style={{ textAlign: 'center', margin: '25px 0' }}>
        <a href={`http://localhost:3000/auth/verify?code=${code}`} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}>
          Verify Email Address
        </a>
      </div>
      <p>If you didn&apos;t want to verify your email, please ignore this email.</p>
      <p>Thank you,<br />The ToolShare Team</p>
    </div>
    <div style={{ textAlign: 'center', padding: '15px', borderTop: '1px solid #e0e0e0', fontSize: '12px', color: '#888' }}>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
);

export const NotificationTemplate: React.FC<Readonly<NotificationEmailProps>> = ({
  username,
  message
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
    <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>Notification</h1>
    </div>
    <div style={{ padding: '20px', color: '#555' }}>
      <p>Hello {username},</p>
      <p>{message}</p>
      <p>Thank you for being part of our community!</p>
      <p>Best regards,<br />The ToolShare Team</p>
    </div>
    <div style={{ textAlign: 'center', padding: '15px', borderTop: '1px solid #e0e0e0', fontSize: '12px', color: '#888' }}>
      <p>You received this email because you enabled notifications in your account settings.</p>
      <p>To manage your notification preferences, visit your <a href="/auth/account" style={{ color: '#2196F3', textDecoration: 'none' }}>account settings</a>.</p>
    </div>
  </div>
);