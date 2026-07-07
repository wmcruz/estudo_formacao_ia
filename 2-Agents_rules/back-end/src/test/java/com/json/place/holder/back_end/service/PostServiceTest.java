package com.json.place.holder.back_end.service;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private PostService postService;

    @Test
    void fetchPostById_shouldReturnPostDto_whenPostExists() {
        PostDto expectedPost = new PostDto(1L, 1L, "Test Title", "Test Body");
        when(restTemplate.getForObject("https://jsonplaceholder.typicode.com/posts/1", PostDto.class))
                .thenReturn(expectedPost);

        PostDto result = postService.fetchPostById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.title()).isEqualTo("Test Title");
        assertThat(result.body()).isEqualTo("Test Body");
        verify(restTemplate, times(1)).getForObject("https://jsonplaceholder.typicode.com/posts/1", PostDto.class);
    }

    @Test
    void fetchPostById_shouldThrowPostNotFoundException_whenPostDoesNotExist() {
        when(restTemplate.getForObject("https://jsonplaceholder.typicode.com/posts/999", PostDto.class))
                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found"));

        assertThatThrownBy(() -> postService.fetchPostById(999L))
                .isInstanceOf(PostNotFoundException.class)
                .hasMessageContaining("Post not found with ID: 999");
        verify(restTemplate, times(1)).getForObject("https://jsonplaceholder.typicode.com/posts/999", PostDto.class);
    }

    @Test
    void fetchAllPosts_shouldReturnListOfPosts() {
        PostDto[] expectedPosts = {
            new PostDto(1L, 1L, "Title 1", "Body 1"),
            new PostDto(1L, 2L, "Title 2", "Body 2")
        };
        when(restTemplate.getForObject("https://jsonplaceholder.typicode.com/posts/", PostDto[].class))
                .thenReturn(expectedPosts);

        List<PostDto> result = postService.fetchAllPosts();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).title()).isEqualTo("Title 1");
        assertThat(result.get(1).title()).isEqualTo("Title 2");
        verify(restTemplate, times(1)).getForObject("https://jsonplaceholder.typicode.com/posts/", PostDto[].class);
    }
}
