package com.json.place.holder.back_end;

public record Post(
    Integer userId,
    Integer id,
    String title,
    String body
) {}
