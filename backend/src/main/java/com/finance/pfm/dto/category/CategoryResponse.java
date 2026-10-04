package com.finance.pfm.dto.category;

import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.TransactionType;

import java.util.UUID;

public class CategoryResponse {

    private UUID id;
    private String name;
    private TransactionType type;
    private String icon;
    private boolean isDefault;

    public CategoryResponse() {
    }

    public CategoryResponse(UUID id, String name, TransactionType type, String icon, boolean isDefault) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.icon = icon;
        this.isDefault = isDefault;
    }

    public static CategoryResponse fromEntity(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getIcon(),
                category.isDefault()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}
