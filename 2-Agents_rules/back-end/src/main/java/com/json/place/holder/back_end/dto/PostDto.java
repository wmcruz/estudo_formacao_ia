package com.json.place.holder.back_end.dto;

public record PostDto(
    Long userId,
    Long id,
    String title,
    String body
) {}
