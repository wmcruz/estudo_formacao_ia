package com.json.place.holder.back_end.service;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.ExternalApiException;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);

    private final RestClient restClient;

    public PostService(RestClient restClient) {
        this.restClient = restClient;
    }

    public List<PostDto> fetchAllPosts() {
        log.info("Fetching all posts from external API");
        try {
            List<PostDto> posts = restClient.get()
                    .uri("/posts")
                    .retrieve()
                    .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                        log.error("Failed to fetch posts from external API");
                        throw new ExternalApiException("Failed to communicate with external API");
                    })
                    .body(new ParameterizedTypeReference<List<PostDto>>() {});
            log.info("Successfully fetched {} posts from external API", posts.size());
            return posts;
        } catch (ExternalApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch posts from external API");
            throw new ExternalApiException("Failed to communicate with external API");
        }
    }

    public PostDto fetchPostById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Post ID must be a positive integer");
        }

        log.info("Fetching post with ID: {}", id);
        try {
            PostDto post = restClient.get()
                    .uri("/posts/{id}", id)
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (request, response) -> {
                        log.warn("Post with ID {} not found in external API", id);
                        throw new PostNotFoundException("Post with ID " + id + " was not found");
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                        log.error("Failed to fetch post with ID: {} from external API", id);
                        throw new ExternalApiException("Failed to communicate with external API");
                    })
                    .body(PostDto.class);
            log.info("Successfully fetched post with ID: {}", id);
            return post;
        } catch (PostNotFoundException | ExternalApiException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch post with ID: {} from external API", id);
            throw new ExternalApiException("Failed to communicate with external API");
        }
    }
}
