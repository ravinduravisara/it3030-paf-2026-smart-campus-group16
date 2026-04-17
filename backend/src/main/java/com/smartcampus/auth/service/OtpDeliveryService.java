package com.smartcampus.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class OtpDeliveryService {
    private static final Logger logger = LoggerFactory.getLogger(OtpDeliveryService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public OtpDeliveryService(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${app.mail.from:no-reply@smartcampus.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public String sendOtp(String email, String name, String otp) {
        if (mailSender == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "OTP email service is unavailable");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject("Smart Campus OTP Verification");
            message.setText(String.format(
                    "Hello %s,%n%nYour Smart Campus verification code is: %s%nThis code will expire in 10 minutes.%n",
                    name != null && !name.isBlank() ? name : "User",
                    otp));
            mailSender.send(message);
            return "OTP sent to your email address.";
        } catch (Exception ex) {
            logger.error("OTP email delivery failed for {}", email, ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Failed to send OTP email. Please try again later.");
        }
    }
}
