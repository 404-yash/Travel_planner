package com.travelplanner.engine.data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** A tiny JSON reader so the project needs no external libraries. Returns Map, List, String, Double, Boolean or null. */
public final class JsonParser {
    private final String s;
    private int i;

    private JsonParser(String s) { this.s = s; }

    public static Object parse(String text) {
        JsonParser p = new JsonParser(text);
        p.ws();
        Object v = p.value();
        p.ws();
        if (p.i != p.s.length()) throw p.err("Unexpected content after JSON value");
        return v;
    }

    private IllegalArgumentException err(String msg) {
        return new IllegalArgumentException(msg + " at position " + i);
    }

    private void ws() {
        while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
    }

    private char peek() {
        if (i >= s.length()) throw err("Unexpected end of JSON");
        return s.charAt(i);
    }

    private void expect(String word) {
        if (!s.startsWith(word, i)) throw err("Expected '" + word + "'");
        i += word.length();
    }

    private Object value() {
        char c = peek();
        switch (c) {
            case '{': return object();
            case '[': return array();
            case '"': return string();
            case 't': expect("true"); return Boolean.TRUE;
            case 'f': expect("false"); return Boolean.FALSE;
            case 'n': expect("null"); return null;
            default: return number();
        }
    }

    private Map<String, Object> object() {
        Map<String, Object> map = new LinkedHashMap<>();
        i++; // {
        ws();
        if (peek() == '}') { i++; return map; }
        while (true) {
            ws();
            String key = string();
            ws();
            if (peek() != ':') throw err("Expected ':'");
            i++;
            ws();
            map.put(key, value());
            ws();
            char c = peek();
            i++;
            if (c == '}') return map;
            if (c != ',') throw err("Expected ',' or '}'");
        }
    }

    private List<Object> array() {
        List<Object> list = new ArrayList<>();
        i++; // [
        ws();
        if (peek() == ']') { i++; return list; }
        while (true) {
            ws();
            list.add(value());
            ws();
            char c = peek();
            i++;
            if (c == ']') return list;
            if (c != ',') throw err("Expected ',' or ']'");
        }
    }

    private String string() {
        if (peek() != '"') throw err("Expected string");
        i++;
        StringBuilder sb = new StringBuilder();
        while (true) {
            char c = peek();
            i++;
            if (c == '"') return sb.toString();
            if (c != '\\') { sb.append(c); continue; }
            char e = peek();
            i++;
            switch (e) {
                case 'n': sb.append('\n'); break;
                case 't': sb.append('\t'); break;
                case 'r': sb.append('\r'); break;
                case 'b': sb.append('\b'); break;
                case 'f': sb.append('\f'); break;
                case 'u':
                    sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
                    i += 4;
                    break;
                default: sb.append(e);
            }
        }
    }

    private Double number() {
        int start = i;
        while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
        if (start == i) throw err("Unexpected character '" + s.charAt(i) + "'");
        return Double.valueOf(s.substring(start, i));
    }
}
