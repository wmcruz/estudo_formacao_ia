package com.json.place.holder.back_end.service;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.exception.PostNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class PostService {

    private final RestTemplate restTemplate;
    private static final String API_URL = "https://jsonplaceholder.typicode.com/posts/";

    public PostService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PostDto fetchPostById(Long id) {
        try {
            String url = API_URL + id;
            return restTemplate.getForObject(url, PostDto.class);
        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode() == org.springframework.http.HttpStatus.NOT_FOUND) {
                throw new PostNotFoundException("Post not found with ID: " + id);
            }
            throw ex;
        }
    }

    public List<PostDto> fetchAllPosts() {
        PostDto[] posts = restTemplate.getForObject(API_URL, PostDto[].class);
        return Arrays.asList(posts);
    }
}
