package com.json.place.holder.back_end.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.http.client.HttpClientSettings;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.client.RestClient;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
class RestClientConfigTest {

    private static final String BASE_URL = "https://jsonplaceholder.typicode.com";

    @Autowired
    private RestClient restClient;

    @Autowired
    private HttpClientSettings httpClientSettings;

    @Test
    void restClient_shouldBeCreatedFromInjectedBuilder() {
        RestClient.Builder builder = mock(RestClient.Builder.class);
        RestClient.Builder builderWithBaseUrl = mock(RestClient.Builder.class);
        RestClient expectedClient = mock(RestClient.class);

        when(builder.baseUrl(BASE_URL)).thenReturn(builderWithBaseUrl);
        when(builderWithBaseUrl.build()).thenReturn(expectedClient);

        RestClient result = new RestClientConfig().restClient(builder, BASE_URL);

        assertThat(result).isSameAs(expectedClient);
        verify(builder).baseUrl(BASE_URL);
        verify(builderWithBaseUrl).build();
    }

    @Test
    void context_shouldProvideRestClientBean() {
        assertThat(restClient).isNotNull();
    }

    @Test
    void httpClientSettings_shouldApplyConfiguredTimeouts() {
        assertThat(httpClientSettings.connectTimeout()).isEqualTo(Duration.ofSeconds(5));
        assertThat(httpClientSettings.readTimeout()).isEqualTo(Duration.ofSeconds(10));
    }
}
