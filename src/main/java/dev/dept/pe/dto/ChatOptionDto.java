package dev.dept.pe.dto;

public class ChatOptionDto {
    private String id;
    private String label;
    private String action;
    private String payload;

    public ChatOptionDto() {}

    public ChatOptionDto(String id, String label, String action, String payload) {
        this.id = id;
        this.label = label;
        this.action = action;
        this.payload = payload;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
}
