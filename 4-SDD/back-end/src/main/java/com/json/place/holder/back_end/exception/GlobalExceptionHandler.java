package com.json.place.holder.back_end.exception;

import com.json.place.holder.back_end.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handlePostNotFound(PostNotFoundException ex) {
        ErrorResponseDto error = new ErrorResponseDto(new ErrorResponseDto.ErrorDetail("POST_NOT_FOUND", ex.getMessage()));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ExternalApiException.class)
    public ResponseEntity<ErrorResponseDto> handleExternalApi(ExternalApiException ex) {
        ErrorResponseDto error = new ErrorResponseDto(new ErrorResponseDto.ErrorDetail("EXTERNAL_API_ERROR", ex.getMessage()));
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponseDto error = new ErrorResponseDto(new ErrorResponseDto.ErrorDetail("INVALID_POST_ID", ex.getMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDto> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ErrorResponseDto error = new ErrorResponseDto(new ErrorResponseDto.ErrorDetail("INVALID_POST_ID", "Post ID must be a positive integer"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
