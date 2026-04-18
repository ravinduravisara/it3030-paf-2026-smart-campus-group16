package com.smartcampus.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentUpdateRequest(
		@NotBlank(message = "Comment text is required")
		@Size(min = 1, max = 1000, message = "Comment must be between 1 and 1000 characters")
		String text
) {
}
