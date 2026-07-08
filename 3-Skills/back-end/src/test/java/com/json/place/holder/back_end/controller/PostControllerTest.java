package com.json.place.holder.back_end.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.json.place.holder.back_end.dto.PageDto;
import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.GlobalExceptionHandler;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import com.json.place.holder.back_end.service.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class PostControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(postController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getPostById_shouldReturn200AndPostDto_whenPostExists() throws Exception {
        PostDto postDto = new PostDto(1L, 1L, "Sample Title", "Sample Body");
        when(postService.fetchPostById(1L)).thenReturn(postDto);

        mockMvc.perform(get("/api/posts/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Sample Title"))
                .andExpect(jsonPath("$.body").value("Sample Body"));
    }

    @Test
    void getPostById_shouldReturn404_whenPostDoesNotExist() throws Exception {
        when(postService.fetchPostById(999L)).thenThrow(new PostNotFoundException("Post not found with ID: 999"));

        mockMvc.perform(get("/api/posts/999")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Post not found with ID: 999"));
    }

    @Test
    void getAllPosts_shouldReturn200AndPaginatedResult() throws Exception {
        List<PostDto> content = List.of(
            new PostDto(1L, 1L, "Title 1", "Body 1"),
            new PostDto(1L, 2L, "Title 2", "Body 2")
        );
        PageDto<PostDto> pageDto = new PageDto<>(content, 0, 10, 2, 1);
        when(postService.fetchPostsPaginated(0, 10)).thenReturn(pageDto);

        mockMvc.perform(get("/api/posts")
                .param("page", "0")
                .param("size", "10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[1].id").value(2))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1));
    }
}
