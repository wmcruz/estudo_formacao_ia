package com.json.place.holder.back_end.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.ExternalApiException;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
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

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";
    private static final String POST_JSON = "{\"userId\":1,\"id\":1,\"title\":\"Title\",\"body\":\"Body\"}";

    private PostService postService;
    private MockRestServiceServer mockServer;
    private ListAppender<ILoggingEvent> logAppender;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl(BASE_URL);
        mockServer = MockRestServiceServer.bindTo(builder).build();
        postService = new PostService(builder.build());
        attachLogAppender();
    }

    @AfterEach
    void tearDown() {
        Logger postLogger = (Logger) LoggerFactory.getLogger(PostService.class);
        postLogger.detachAppender(logAppender);
    }

    @Test
    void fetchPostById_shouldReturnPostDto_whenPostExists() {
        mockServer.expect(requestTo(BASE_URL + "/posts/1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(POST_JSON, MediaType.APPLICATION_JSON));

        PostDto result = postService.fetchPostById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1);
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldThrowPostNotFoundException_whenNotFound() {
        mockServer.expect(requestTo(BASE_URL + "/posts/999"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThatThrownBy(() -> postService.fetchPostById(999L))
                .isInstanceOf(PostNotFoundException.class)
                .hasMessage("Post with ID 999 was not found");
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldThrowExternalApiException_whenApiIsDown() {
        mockServer.expect(requestTo(BASE_URL + "/posts/1"))
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
    void fetchPostById_shouldThrowIllegalArgumentException_whenIdIsNull() {
        assertThatThrownBy(() -> postService.fetchPostById(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Post ID must be a positive integer");
    }

    @Test
    void fetchPostById_shouldLogInfo_whenStarted() {
        mockServer.expect(requestTo(BASE_URL + "/posts/1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(POST_JSON, MediaType.APPLICATION_JSON));

        postService.fetchPostById(1L);

        assertThat(logMessages()).contains("Fetching post with ID: 1");
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldLogInfo_whenSuccess() {
        mockServer.expect(requestTo(BASE_URL + "/posts/1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(POST_JSON, MediaType.APPLICATION_JSON));

        postService.fetchPostById(1L);

        assertThat(logMessages()).contains("Successfully fetched post with ID: 1");
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldLogWarn_whenPostNotFound() {
        mockServer.expect(requestTo(BASE_URL + "/posts/999"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThatThrownBy(() -> postService.fetchPostById(999L))
                .isInstanceOf(PostNotFoundException.class)
                .hasMessage("Post with ID 999 was not found");

        assertThat(logMessages()).contains("Post with ID 999 not found in external API");
        mockServer.verify();
    }

    @Test
    void fetchPostById_shouldLogError_whenUpstreamFails() {
        mockServer.expect(requestTo(BASE_URL + "/posts/1"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> postService.fetchPostById(1L))
                .isInstanceOf(ExternalApiException.class);

        assertThat(logMessages()).contains("Failed to fetch post with ID: 1 from external API");
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldReturnList_whenSuccessful() {
        mockServer.expect(requestTo(BASE_URL + "/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("[" + POST_JSON + "]", MediaType.APPLICATION_JSON));

        List<PostDto> result = postService.fetchAllPosts();

        assertThat(result).hasSize(1);
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldReturnEmptyList_whenApiReturnsEmpty() {
        mockServer.expect(requestTo(BASE_URL + "/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        List<PostDto> result = postService.fetchAllPosts();

        assertThat(result).isEmpty();
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldLogInfo_whenStartedAndSucceeded() {
        mockServer.expect(requestTo(BASE_URL + "/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(buildPostsJson(100), MediaType.APPLICATION_JSON));

        postService.fetchAllPosts();

        assertThat(logMessages()).contains(
                "Fetching all posts from external API",
                "Successfully fetched 100 posts from external API");
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldThrowExternalApiException_whenApiIsDown() {
        mockServer.expect(requestTo(BASE_URL + "/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> postService.fetchAllPosts())
                .isInstanceOf(ExternalApiException.class);
        mockServer.verify();
    }

    @Test
    void fetchAllPosts_shouldLogError_whenUpstreamFails() {
        mockServer.expect(requestTo(BASE_URL + "/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> postService.fetchAllPosts())
                .isInstanceOf(ExternalApiException.class);

        assertThat(logMessages()).contains("Failed to fetch posts from external API");
        mockServer.verify();
    }

    @Test
    void logs_shouldNotContainSensitiveData() {
        mockServer.expect(requestTo(BASE_URL + "/posts"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(buildPostsJson(3), MediaType.APPLICATION_JSON));

        postService.fetchAllPosts();

        List<String> sensitiveMarkers = List.of("password", "secret", "token", "credential", "authorization", "private");
        assertThat(logMessages())
                .as("logs must not leak sensitive data")
                .noneMatch(message -> sensitiveMarkers.stream().anyMatch(message::contains));
        mockServer.verify();
    }

    private void attachLogAppender() {
        Logger postLogger = (Logger) LoggerFactory.getLogger(PostService.class);
        logAppender = new ListAppender<>();
        logAppender.start();
        postLogger.addAppender(logAppender);
    }

    private List<String> logMessages() {
        return logAppender.list.stream()
                .map(ILoggingEvent::getFormattedMessage)
                .toList();
    }

    private String buildPostsJson(int count) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 1; i <= count; i++) {
            if (i > 1) {
                json.append(",");
            }
            json.append("{\"userId\":1,\"id\":").append(i)
                    .append(",\"title\":\"Title ").append(i).append("\",\"body\":\"Body\"}");
        }
        return json.append("]").toString();
    }
}
