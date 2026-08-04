package com.json.place.holder.back_end.controller;

import com.json.place.holder.back_end.dto.PostDto;
import com.json.place.holder.back_end.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> fetchAllPosts() {
        return ResponseEntity.ok(postService.fetchAllPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> fetchPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.fetchPostById(id));
    }
}
