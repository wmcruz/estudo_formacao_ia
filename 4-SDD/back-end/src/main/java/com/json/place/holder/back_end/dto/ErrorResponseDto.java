package com.json.place.holder.back_end.dto;

public record ErrorResponseDto(ErrorDetail error) {
    public record ErrorDetail(String code, String message) {}
}
