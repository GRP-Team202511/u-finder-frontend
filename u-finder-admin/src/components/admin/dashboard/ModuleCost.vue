<template>
  <Card class="panel">
    <div class="panel__header">
      <h2 class="panel__title">Model Cost Snapshot</h2>
      <span class="pill-tag">Today</span>
    </div>

    <div class="filter-grid">
      <div class="field">
        <label class="field__label">Model</label>
        <Select :model-value="selectedModel" @update:model-value="handleModelChange">
          <SelectTrigger class="field__input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
            <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
            <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
            <SelectItem value="chat">chat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="field">
        <label class="field__label">Time Range</label>
        <Select :model-value="selectedRange" @update:model-value="handleRangeChange">
          <SelectTrigger class="field__input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24 hours">24 hours</SelectItem>
            <SelectItem value="7 days">7 days</SelectItem>
            <SelectItem value="30 days">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="stats-grid">
      <div class="mini-stat">
        <div class="mini-stat__label">Total Requests</div>
        <div class="mini-stat__value">3,912</div>
        <div class="mini-stat__sub">avg latency: 1.8s</div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat__label">Estimated Cost</div>
        <div class="mini-stat__value">$18.42</div>
        <div class="mini-stat__sub">tokens: 9.7M</div>
      </div>
    </div>

    <div class="actions">
      <Button variant="outline" size="default" class="secondary-btn">Download</Button>
      <Button variant="default" size="default" class="primary-btn">Set Alert</Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const selectedModel = ref('gpt-4.1-mini')
const selectedRange = ref('24 hours')

function handleModelChange(value: any) {
  if (typeof value !== 'string') return
  selectedModel.value = value
}

function handleRangeChange(value: any) {
  if (typeof value !== 'string') return
  selectedRange.value = value
}
</script>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 28px;
  padding: 20px;
  box-sizing: border-box;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel__title {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
  color: #111111;
}

.pill-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid #d8d8d8;
  background: #f7f7f7;
  font-size: 12px;
  font-weight: 700;
  color: #111111;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field__label {
  font-size: 13px;
  color: #6b6b6b;
  font-weight: 500;
}

.field__input {
  width: 100%;
  height: 42px;
  min-width: 0;
  font-size: 13px;
  box-sizing: border-box;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.mini-stat {
  border: 1px solid #dddddd;
  border-radius: 18px;
  padding: 18px;
  min-height: 112px;
  box-sizing: border-box;
}

.mini-stat__label {
  font-size: 13px;
  color: #6b6b6b;
  margin-bottom: 8px;
}

.mini-stat__value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.05;
  color: #111111;
  margin-bottom: 8px;
}

.mini-stat__sub {
  font-size: 12px;
  color: #6b6b6b;
  line-height: 1.35;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary-btn,
.primary-btn {
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .filter-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
