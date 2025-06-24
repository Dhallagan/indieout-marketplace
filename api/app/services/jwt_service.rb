class JwtService
  SECRET_KEY = ENV.fetch('JWT_SECRET', 'iamgroot')
  EXPIRES_IN = ENV.fetch('JWT_EXPIRES_IN', '7d')

  def self.encode(payload)
    expires_at = case EXPIRES_IN
                 when /(\d+)d/
                   $1.to_i.days.from_now
                 when /(\d+)h/
                   $1.to_i.hours.from_now
                 when /(\d+)m/
                   $1.to_i.minutes.from_now
                 else
                   7.days.from_now
                 end

    payload[:exp] = expires_at.to_i
    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
    decoded[0]
  rescue JWT::ExpiredSignature
    raise StandardError, 'Token has expired'
  rescue JWT::DecodeError
    raise StandardError, 'Invalid token'
  end
end