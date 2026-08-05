package com.json.place.holder.back_end.exception;

import com.json.place.holder.back_end.dto.ErrorResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handlePostNotFound_shouldReturn404AndErrorCode() {
        PostNotFoundException ex = new PostNotFoundException("Post with ID 999 was not found");
        ResponseEntity<ErrorResponseDto> response = handler.handlePostNotFound(ex);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error().code()).isEqualTo("POST_NOT_FOUND");
        assertThat(response.getBody().error().message()).isEqualTo("Post with ID 999 was not found");
    }

    @Test
    void handleExternalApi_shouldReturn502AndErrorCode() {
        ExternalApiException ex = new ExternalApiException("Failed to communicate...");
        ResponseEntity<ErrorResponseDto> response = handler.handleExternalApi(ex);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error().code()).isEqualTo("EXTERNAL_API_ERROR");
        assertThat(response.getBody().error().message()).isEqualTo("Failed to communicate...");
    }

    @Test
    void handleIllegalArgument_shouldReturn400AndErrorCode() {
        IllegalArgumentException ex = new IllegalArgumentException("Post ID must be a positive integer");
        ResponseEntity<ErrorResponseDto> response = handler.handleIllegalArgument(ex);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error().code()).isEqualTo("INVALID_POST_ID");
        assertThat(response.getBody().error().message()).isEqualTo("Post ID must be a positive integer");
    }

    @Test
    void handleTypeMismatch_shouldReturn400AndErrorCode() {
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                "abc", Long.class, "id", null, null);
        ResponseEntity<ErrorResponseDto> response = handler.handleTypeMismatch(ex);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().error().code()).isEqualTo("INVALID_POST_ID");
        assertThat(response.getBody().error().message()).isEqualTo("Post ID must be a positive integer");
    }
}
