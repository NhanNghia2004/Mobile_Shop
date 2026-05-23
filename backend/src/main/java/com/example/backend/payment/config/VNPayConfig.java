package com.example.backend.payment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VNPayConfig {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.ipn-url:}")
    private String ipnUrl;

    @Value("${vnpay.version:2.1.0}")
    private String version;

    @Value("${vnpay.command:pay}")
    private String command;

    @Value("${vnpay.currency-code:VND}")
    private String currencyCode;

    @Value("${vnpay.locale:vn}")
    private String locale;

    public String getTmnCode()      { return tmnCode; }
    public String getHashSecret()   { return hashSecret; }
    public String getPayUrl()       { return payUrl; }
    public String getReturnUrl()    { return returnUrl; }
    public String getIpnUrl()       { return ipnUrl; }
    public String getVersion()      { return version; }
    public String getCommand()      { return command; }
    public String getCurrencyCode() { return currencyCode; }
    public String getLocale()       { return locale; }
}