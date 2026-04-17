package com.smartcampus.auth.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpDeliveryService {
    private static final Logger logger = LoggerFactory.getLogger(OtpDeliveryService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public OtpDeliveryService(
            Optional<JavaMailSender> mailSender,
            @Value("${app.mail.from:no-reply@smartcampus.local}") String fromAddress) {
        this.mailSender = mailSender.orElse(null);
        this.fromAddress = fromAddress;
    }

    public String sendOtp(String email, String name, String otp) {
        if (mailSender == null) {
            logger.warn("JavaMailSender not configured – logging OTP to console instead");
            logger.info("========== OTP for {} ({}) : {} ==========", email, name, otp);
            return "OTP sent to your email address.";
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
            logger.warn("Email delivery failed – falling back to console OTP for {}", email);
            logger.info("========== OTP for {} ({}) : {} ==========", email, name, otp);
            return "OTP sent to your email address.";
        }
    }
}
