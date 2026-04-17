package com.smartcampus.config;

import java.util.List;
import java.util.Locale;

import com.smartcampus.resource.model.ResourceStatus;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.lang.NonNull;

@Configuration
public class MongoConversionsConfig {
	@Bean
	@SuppressWarnings("null")
	public MongoCustomConversions mongoCustomConversions() {
		return new MongoCustomConversions(List.of(
				new StringToResourceStatusConverter(),
				new ResourceStatusToStringConverter()
		));
	}

	@ReadingConverter
	static class StringToResourceStatusConverter implements Converter<String, ResourceStatus> {
		@Override
		public ResourceStatus convert(@NonNull String source) {
			String normalized = source.trim();
			if (normalized.isEmpty()) {
				return ResourceStatus.ACTIVE;
			}

			normalized = normalized.toUpperCase(Locale.ROOT);

			return switch (normalized) {
				case "AVAILABLE", "ACTIVE" -> ResourceStatus.ACTIVE;
				case "UNAVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE" -> ResourceStatus.OUT_OF_SERVICE;
				default -> ResourceStatus.valueOf(normalized);
			};
		}
	}

	@WritingConverter
	static class ResourceStatusToStringConverter implements Converter<ResourceStatus, String> {
		@Override
		public String convert(@NonNull ResourceStatus source) {
			return source.name();
		}
	}
}
