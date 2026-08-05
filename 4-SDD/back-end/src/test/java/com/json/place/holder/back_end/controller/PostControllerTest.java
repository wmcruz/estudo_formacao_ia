package com.json.place.holder.back_end.controller;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.ExternalApiException;
import com.json.place.holder.back_end.exception.GlobalExceptionHandler;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import com.json.place.holder.back_end.service.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PostControllerTest {

    private MockMvc mockMvc;
    private PostService postService;

    @BeforeEach
    void setUp() {
        postService = mock(PostService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new PostController(postService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void fetchAllPosts_shouldReturn200AndList() throws Exception {
        when(postService.fetchAllPosts()).thenReturn(List.of(new PostDto(1, 1, "Title", "Body")));

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void fetchAllPosts_shouldReturn502OnExternalApiError() throws Exception {
        when(postService.fetchAllPosts()).thenThrow(new ExternalApiException("Failed to communicate with external API"));

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error.code").value("EXTERNAL_API_ERROR"));
    }

    @Test
    void fetchPostById_shouldReturn200AndPost() throws Exception {
        when(postService.fetchPostById(1L)).thenReturn(new PostDto(1, 1, "Title", "Body"));

        mockMvc.perform(get("/api/posts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void fetchPostById_shouldReturn404WhenNotFound() throws Exception {
        when(postService.fetchPostById(999L)).thenThrow(new PostNotFoundException("Post with ID 999 was not found"));

        mockMvc.perform(get("/api/posts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("POST_NOT_FOUND"));
    }

    @Test
    void fetchPostById_shouldReturn502OnExternalApiError() throws Exception {
        when(postService.fetchPostById(1L)).thenThrow(new ExternalApiException("Failed to communicate with external API"));

        mockMvc.perform(get("/api/posts/1"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error.code").value("EXTERNAL_API_ERROR"));
    }

    @Test
    void fetchPostById_shouldReturn400OnInvalidStringId() throws Exception {
        mockMvc.perform(get("/api/posts/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_POST_ID"))
                .andExpect(jsonPath("$.error.message").value("Post ID must be a positive integer"));
    }

    @Test
    void fetchPostById_shouldReturn400OnNegativeId() throws Exception {
        when(postService.fetchPostById(-1L)).thenThrow(new IllegalArgumentException("Post ID must be a positive integer"));

        mockMvc.perform(get("/api/posts/-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_POST_ID"));
    }
}
