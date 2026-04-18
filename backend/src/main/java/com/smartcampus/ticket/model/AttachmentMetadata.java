package com.smartcampus.ticket.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class AttachmentMetadata {
	@NotBlank(message = "File name is required")
	private String fileName;

	@NotBlank(message = "Content type is required")
	@Pattern(regexp = "image/(jpeg|png|gif|webp|bmp|svg\\+xml)",
			message = "Only image files are allowed (JPEG, PNG, GIF, WebP, BMP, SVG)")
	private String contentType;

	@Positive(message = "File size must be positive")
	@Max(value = 5_242_880, message = "Each attachment must not exceed 5 MB")
	private long size;

	@NotBlank(message = "File data is required")
	private String base64Data;

	public String getFileName() { return fileName; }
	public void setFileName(String fileName) { this.fileName = fileName; }

	public String getContentType() { return contentType; }
	public void setContentType(String contentType) { this.contentType = contentType; }

	public long getSize() { return size; }
	public void setSize(long size) { this.size = size; }

	public String getBase64Data() { return base64Data; }
	public void setBase64Data(String base64Data) { this.base64Data = base64Data; }
}
