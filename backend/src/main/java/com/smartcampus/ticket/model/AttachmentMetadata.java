package com.smartcampus.ticket.model;

public class AttachmentMetadata {
	private String fileName;
	private String contentType;
	private long size;
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
