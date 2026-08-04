package com.json.place.holder.back_end.service;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.ExternalApiException;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PostServiceTest {

    private PostService postService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://jsonplaceholder.typicode.com");
        mockServer = MockRestServiceServer.bindTo(builder).build();
        postService = new PostService(builder.build());
    }

    @Test
    void fetchPostById_shouldReturnPostDto_whenPostExists() {
        mockServer.expect(requestTo("https://jsonplaceholder.typicode.com/posts/1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"userId\":1,\"id\":1,\"title\":\"Title\",\"body\":\"Body\"}", MediaType.APPLICATION_JSON));

        PostDto result = postService.fetchPostById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1);
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldThrowPostNotFoundException_whenNotFound() {
        mockServer.expect(requestTo("https://jsonplaceholder.typicode.com/posts/999"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThatThrownBy(() -> postService.fetchPostById(999L))
                .isInstanceOf(PostNotFoundException.class)
                .hasMessage("Post with ID 999 was not found");
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldThrowExternalApiException_whenApiIsDown() {
        mockServer.expect(requestTo("https://jsonplaceholder.typicode.com/posts/1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> postService.fetchPostById(1L))
                .isInstanceOf(ExternalApiException.class);
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldThrowIllegalArgumentException_whenIdIsZero() {
        assertThatThrownBy(() -> postService.fetchPostById(0L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void fetchPostById_shouldThrowIllegalArgumentException_whenIdIsNegative() {
        assertThatThrownBy(() -> postService.fetchPostById(-5L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void fetchAllPosts_shouldReturnList_whenSuccessful() {
        mockServer.expect(requestTo("https://jsonplaceholder.typicode.com/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("[{\"userId\":1,\"id\":1,\"title\":\"Title\",\"body\":\"Body\"}]", MediaType.APPLICATION_JSON));

        List<PostDto> result = postService.fetchAllPosts();

        assertThat(result).hasSize(1);
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldReturnEmptyList_whenApiReturnsEmpty() {
        mockServer.expect(requestTo("https://jsonplaceholder.typicode.com/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        List<PostDto> result = postService.fetchAllPosts();

        assertThat(result).isEmpty();
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldThrowExternalApiException_whenApiIsDown() {
        mockServer.expect(requestTo("https://jsonplaceholder.typicode.com/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> postService.fetchAllPosts())
                .isInstanceOf(ExternalApiException.class);
        mockServer.verify();
    }
}
