package com.auth.dto;

import java.util.List;

public class PaginatedResponse<T> {
    private List<T> data;
    private long total;
    private int page;
    private int totalPages;

    public PaginatedResponse(List<T> data, long total, int page, int totalPages) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.totalPages = totalPages;
    }

    public List<T> getData() { return data; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getTotalPages() { return totalPages; }
}
