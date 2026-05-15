package com.example.backend.product.dto;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SearchKeywordParser {

    //Pattern storage
    private static final Pattern STORAGE_PATTERN =
            Pattern.compile("\\b(\\d+)\\s*(gb|tb)\\b", Pattern.CASE_INSENSITIVE);

    // Pattern RAM:
    private static final Pattern RAM_PREFIX_PATTERN =
            Pattern.compile("\\bram\\s*(\\d+)(?:\\s*gb)?\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern RAM_SUFFIX_PATTERN =
            Pattern.compile("\\b(\\d+)(?:\\s*gb)?\\s*ram\\b", Pattern.CASE_INSENSITIVE);

    // Từ điển màu sắc (Vietnamese + English)
    private static final Map<String, String> COLOR_ALIASES = new LinkedHashMap<>();
    static {
        // Tiếng Việt
        COLOR_ALIASES.put("đen",       "đen");
        COLOR_ALIASES.put("den",        "đen");
        COLOR_ALIASES.put("trắng",     "trắng");
        COLOR_ALIASES.put("trang",      "trắng");
        COLOR_ALIASES.put("xanh",       "xanh");
        COLOR_ALIASES.put("xanh lá",    "xanh lá");
        COLOR_ALIASES.put("xanh lam",   "xanh lam");
        COLOR_ALIASES.put("xanh dương", "xanh dương");
        COLOR_ALIASES.put("đỏ",        "đỏ");
        COLOR_ALIASES.put("do",         "đỏ");
        COLOR_ALIASES.put("vàng",      "vàng");
        COLOR_ALIASES.put("vang",       "vàng");
        COLOR_ALIASES.put("hồng",      "hồng");
        COLOR_ALIASES.put("hong",       "hồng");
        COLOR_ALIASES.put("tím",       "tím");
        COLOR_ALIASES.put("tim",        "tím");
        COLOR_ALIASES.put("xám",       "xám");
        COLOR_ALIASES.put("xam",        "xám");
        COLOR_ALIASES.put("bạc",       "bạc");
        COLOR_ALIASES.put("bac",        "bạc");
        COLOR_ALIASES.put("cam",        "cam");
        COLOR_ALIASES.put("nâu",       "nâu");
        COLOR_ALIASES.put("nau",        "nâu");
        COLOR_ALIASES.put("be",         "be");
        COLOR_ALIASES.put("kem",        "kem");
        COLOR_ALIASES.put("xanh đậm",  "xanh đậm");
        COLOR_ALIASES.put("midnight",   "midnight");
        COLOR_ALIASES.put("starlight",  "starlight");
        COLOR_ALIASES.put("titan",      "titan");
        COLOR_ALIASES.put("titanium",   "titan");
        // Tiếng Anh
        COLOR_ALIASES.put("black",      "đen");
        COLOR_ALIASES.put("white",      "trắng");
        COLOR_ALIASES.put("blue",       "xanh");
        COLOR_ALIASES.put("green",      "xanh lá");
        COLOR_ALIASES.put("red",        "đỏ");
        COLOR_ALIASES.put("yellow",     "vàng");
        COLOR_ALIASES.put("pink",       "hồng");
        COLOR_ALIASES.put("purple",     "tím");
        COLOR_ALIASES.put("gray",       "xám");
        COLOR_ALIASES.put("grey",       "xám");
        COLOR_ALIASES.put("silver",     "bạc");
        COLOR_ALIASES.put("gold",       "vàng");
        COLOR_ALIASES.put("orange",     "cam");
        COLOR_ALIASES.put("brown",      "nâu");
    }

    // Màu nhiều từ sắp xếp dài → ngắn để match greedy trước
    private static final List<String> COLOR_KEYS_SORTED = new ArrayList<>(COLOR_ALIASES.keySet());
    static {
        COLOR_KEYS_SORTED.sort(Comparator.comparingInt(String::length).reversed());
    }

    // ── OS keywords
    private static final Map<String, String> OS_KEYWORDS = new LinkedHashMap<>();
    static {
        OS_KEYWORDS.put("ios",      "iOS");
        OS_KEYWORDS.put("iphone",   "iOS");   // "iphone" ngụ ý iOS
        OS_KEYWORDS.put("android",  "Android");
    }

    // ─────────────────────────────────────────────────────────────────────────

    public ParsedKeyword parse(String raw) {
        ParsedKeyword result = new ParsedKeyword();
        if (raw == null || raw.isBlank()) return result;

        String input = raw.trim().toLowerCase();
        result.setRawKeyword(raw.trim());

        // 1. Tách RAM trước
        input = extractRam(input, result);

        // 2. Tách Storage
        input = extractStorage(input, result);

        // 3. Tách màu
        input = extractColors(input, result);

        input = extractOs(input, result);

        Arrays.stream(input.split("\\s+"))
                .map(String::trim)
                .filter(t -> t.length() >= 2)
                .forEach(result.getTextTokens()::add);

        return result;
    }

    //  private helpers

    private String extractRam(String input, ParsedKeyword out) {
        // "ram 8", "ram8gb"
        Matcher m = RAM_PREFIX_PATTERN.matcher(input);
        if (m.find()) {
            out.setRamGb(Integer.parseInt(m.group(1)));
            return m.replaceFirst(" ").trim();
        }
        // "8gb ram", "8 ram"
        m = RAM_SUFFIX_PATTERN.matcher(input);
        if (m.find()) {
            out.setRamGb(Integer.parseInt(m.group(1)));
            return m.replaceFirst(" ").trim();
        }
        return input;
    }

    private String extractStorage(String input, ParsedKeyword out) {
        Matcher m = STORAGE_PATTERN.matcher(input);
        if (m.find()) {
            int value = Integer.parseInt(m.group(1));
            String unit = m.group(2).toLowerCase();
            out.setStorageGb("tb".equals(unit) ? value * 1024 : value);
            return m.replaceFirst(" ").trim();
        }
        return input;
    }

    private String extractColors(String input, ParsedKeyword out) {
        for (String key : COLOR_KEYS_SORTED) {
            // word-boundary dùng space hoặc đầu/cuối chuỗi vì tiếng Việt không có \b chuẩn
            String escaped = Pattern.quote(key);
            Pattern p = Pattern.compile("(?<![\\w\\u00C0-\\u024F])" + escaped
                    + "(?![\\w\\u00C0-\\u024F])", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(input);
            if (m.find()) {
                out.getColors().add(COLOR_ALIASES.get(key));
                input = m.replaceFirst(" ").trim();
            }
        }
        return input;
    }

    private String extractOs(String input, ParsedKeyword out) {
        for (Map.Entry<String, String> entry : OS_KEYWORDS.entrySet()) {
            String escaped = Pattern.quote(entry.getKey());
            Pattern p = Pattern.compile("(?<![\\w\\u00C0-\\u024F])" + escaped
                    + "(?![\\w\\u00C0-\\u024F])", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(input);
            if (m.find()) {
                out.setOs(entry.getValue());
                input = m.replaceFirst(" ").trim();
                break; // chỉ lấy 1 OS
            }
        }
        return input;
    }
}