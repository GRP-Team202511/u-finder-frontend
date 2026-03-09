<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MoreVertical, Pencil, Trash2 } from 'lucide-vue-next'
import type { ConversationItem } from '@/types/chat'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<{
  conversations: ConversationItem[]
  hasMore: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  loadMore: []
  delete: [conversationId: string]
  rename: [conversationId: string, currentName: string]
}>()

const { t } = useI18n()
const router = useRouter()

const activeConversationId = ref<string | null>(null)
const hoveredConversationId = ref<string | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const isActive = (conversationId: string) => {
  return activeConversationId.value === conversationId
}

const isHovered = (conversationId: string) => {
  return hoveredConversationId.value === conversationId
}

const handleConversationClick = (conversationId: string) => {
  // 保存到 sessionStorage
  sessionStorage.setItem('currentConversationId', conversationId)
  activeConversationId.value = conversationId
  // 触发自定义事件通知 AIChat
  window.dispatchEvent(new CustomEvent('conversation-changed', { detail: { conversationId } }))
  router.push({ name: 'AIChat' })
}

const handleDelete = (conversationId: string, event: Event) => {
  event.stopPropagation()
  emit('delete', conversationId)
}

const handleRename = (conversationId: string, currentName: string, event: Event) => {
  event.stopPropagation()
  emit('rename', conversationId, currentName)
}

// 监听对话切换事件
const onConversationChanged = (event: CustomEvent) => {
  const { conversationId } = event.detail
  activeConversationId.value = conversationId
}

onMounted(() => {
  // 从 sessionStorage 读取当前激活的对话
  activeConversationId.value = sessionStorage.getItem('currentConversationId')
  
  // 监听对话切换事件
  window.addEventListener('conversation-changed', onConversationChanged as EventListener)
  
  if (!loadMoreTrigger.value) return
  
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry?.isIntersecting && props.hasMore && !props.loading) {
      emit('loadMore')
    }
  }, { threshold: 0.1 })
  
  observer.observe(loadMoreTrigger.value)
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('conversation-changed', onConversationChanged as EventListener)
})
</script>

<template>
  <SidebarGroup>
    <!-- Conversations Header -->
    <SidebarGroupLabel>
      {{ t('sidebar.conversations') }}
    </SidebarGroupLabel>

    <!-- Empty State -->
    <div 
      v-if="!conversations.length && !loading"
      class="px-2 py-4 text-center text-xs text-muted-foreground"
    >
      {{ t('sidebar.noConversations') }}
    </div>

    <!-- Conversations List -->
    <SidebarMenu v-else>
      <SidebarMenuItem
        v-for="conversation in conversations"
        :key="conversation.id"
      >
        <div
          :class="cn(
            'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors min-w-0 w-full',
            isActive(conversation.id) 
              ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
              : 'hover:bg-accent hover:text-accent-foreground'
          )"
          @click="handleConversationClick(conversation.id)"
          @mouseenter="hoveredConversationId = conversation.id"
          @mouseleave="hoveredConversationId = null"
        >
          <!-- Conversation Name -->
          <span class="flex-1 truncate text-sm min-w-0 text-left">
            {{ conversation.name }}
          </span>

          <!-- More Options Menu -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                :class="cn(
                  'h-6 w-6 transition-opacity shrink-0',
                  isHovered(conversation.id) ? 'opacity-100' : 'opacity-0'
                )"
                @click.stop
              >
                <MoreVertical class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="handleRename(conversation.id, conversation.name, $event)">
                <Pencil class="mr-2 h-4 w-4" />
                {{ t('sidebar.rename') }}
              </DropdownMenuItem>
              <DropdownMenuItem 
                class="text-destructive focus:text-destructive"
                @click="handleDelete(conversation.id, $event)"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                {{ t('sidebar.delete') }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>

    <!-- Load More Trigger -->
    <div
      v-if="hasMore"
      ref="loadMoreTrigger"
      class="h-4"
    />

    <!-- Loading Indicator -->
    <div
      v-if="loading"
      class="px-2 py-2 text-center text-xs text-muted-foreground"
    >
      {{ t('sidebar.loading') }}
    </div>
  </SidebarGroup>
</template>
