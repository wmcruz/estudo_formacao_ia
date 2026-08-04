package com.json.place.holder.back_end.service;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.ExternalApiException;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class PostService {

    private final RestClient restClient;

    public PostService(RestClient restClient) {
        this.restClient = restClient;
    }

    public List<PostDto> fetchAllPosts() {
        try {
            return restClient.get()
                    .uri("/posts")
                    .retrieve()
                    .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                        throw new ExternalApiException("Failed to communicate with external API");
                    })
                    .body(new ParameterizedTypeReference<List<PostDto>>() {});
        } catch (ExternalApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ExternalApiException("Failed to communicate with external API");
        }
    }

    public PostDto fetchPostById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Post ID must be a positive integer");
        }
        
        try {
            return restClient.get()
                    .uri("/posts/{id}", id)
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (request, response) -> {
                        throw new PostNotFoundException("Post with ID " + id + " was not found");
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                        throw new ExternalApiException("Failed to communicate with external API");
                    })
                    .body(PostDto.class);
        } catch (PostNotFoundException | ExternalApiException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new ExternalApiException("Failed to communicate with external API");
        }
    }
}
