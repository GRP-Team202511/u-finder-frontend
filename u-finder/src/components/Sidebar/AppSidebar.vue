<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { SidebarProps } from "@/components/ui/sidebar"
import type { ConversationItem } from '@/types/chat'

import {
  Plus,
  Star,
  User,
} from "lucide-vue-next"
import NavMain from "@/components/Sidebar/NavMain.vue"
import NavUser from "@/components/Sidebar/NavUser.vue"
import ConversationList from "@/components/Sidebar/ConversationList.vue"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useUserStore } from "@/stores/userStore"
import { getConversations, deleteConversation, renameConversation } from '@/api/chatApi'

const props = defineProps<SidebarProps>()

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

// State
const conversations = ref<ConversationItem[]>([])
const hasMore = ref(false)
const loading = ref(false)
const lastId = ref<string>()

// Delete dialog state
const showDeleteDialog = ref(false)
const deleteConversationId = ref<string>()

// Rename dialog state
const showRenameDialog = ref(false)
const renameConversationId = ref<string>()
const newConversationName = ref('')

const data = {
  user: {
    name: userStore.user?.name,
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      titleKey: "sidebar.favourite",
      to: { name: 'Cover' }, // to be updated when the page is being developed
      icon: Star,
    },
    {
      titleKey: "sidebar.profile",
      to: { name: 'UserProfile' },
      icon: User,
    },
  ],
}

// Load conversations
const loadConversations = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await getConversations({
      last_id: isLoadMore ? lastId.value : undefined,
      limit: 20,
    })
    
    if (isLoadMore) {
      conversations.value = [...conversations.value, ...response.data]
    } else {
      conversations.value = response.data
    }
    
    hasMore.value = response.has_more
    
    if (response.data.length > 0) {
      const lastItem = response.data[response.data.length - 1]
      if (lastItem) {
        lastId.value = lastItem.id
      }
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loading.value = false
  }
}

// Handle new chat
const handleNewChat = () => {
  router.push({ name: 'AIChat' })
}

// Handle delete conversation
const handleDeleteConversation = (conversationId: string) => {
  deleteConversationId.value = conversationId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteConversationId.value) return
  
  try {
    await deleteConversation(deleteConversationId.value)
    conversations.value = conversations.value.filter(
      conv => conv.id !== deleteConversationId.value
    )
    showDeleteDialog.value = false
    deleteConversationId.value = undefined
  } catch (error) {
    console.error('Failed to delete conversation:', error)
  }
}

// Handle rename conversation
const handleRenameConversation = (conversationId: string, currentName: string) => {
  renameConversationId.value = conversationId
  newConversationName.value = currentName
  showRenameDialog.value = true
}

const confirmRename = async () => {
  if (!renameConversationId.value || !newConversationName.value.trim()) return
  
  try {
    await renameConversation({
      conversationId: renameConversationId.value,
      name: newConversationName.value.trim(),
    })
    
    const conversation = conversations.value.find(
      conv => conv.id === renameConversationId.value
    )
    if (conversation) {
      conversation.name = newConversationName.value.trim()
    }
    
    showRenameDialog.value = false
    renameConversationId.value = undefined
    newConversationName.value = ''
  } catch (error) {
    console.error('Failed to rename conversation:', error)
  }
}

onMounted(() => {
  loadConversations()
})
</script>

<template>
  <Sidebar v-bind="props" collapsible="icon">
    <SidebarHeader class="px-3 py-2 flex items-start justify-between">
      <div class="flex items-center w-full">
        <SidebarTrigger />
        <Button
          variant="ghost"
          size="sm"
          class="ml-2 flex items-center gap-2 group-data-[collapsible=icon]:hidden"
          @click="handleNewChat"
        >
          <Plus class="h-4 w-4" />
          <span>{{ t('sidebar.newChat') }}</span>
        </Button>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <div class="pt-4">
        <!-- Other Navigation Items -->
        <NavMain :items="data.navMain" />

        <SidebarSeparator class="my-4 group-data-[collapsible=icon]:hidden" />

        <!-- Conversations List -->
        <div class="group-data-[collapsible=icon]:hidden">
          <ConversationList
            :conversations="conversations"
            :has-more="hasMore"
            :loading="loading"
            @load-more="loadConversations(true)"
            @delete="handleDeleteConversation"
            @rename="handleRenameConversation"
          />
        </div>
      </div>
    </SidebarContent>
    
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    
    <SidebarRail />
  </Sidebar>

  <!-- Delete Confirmation Dialog -->
  <Sheet v-model:open="showDeleteDialog">
    <SheetContent side="bottom" class="sm:max-w-md sm:mx-auto">
      <SheetHeader>
        <SheetTitle>{{ t('sidebar.deleteConversation') }}</SheetTitle>
        <SheetDescription>
          {{ t('sidebar.deleteConfirm') }}
        </SheetDescription>
      </SheetHeader>
      <SheetFooter class="mt-4">
        <SheetClose as-child>
          <Button variant="outline">
            {{ t('sidebar.cancel') }}
          </Button>
        </SheetClose>
        <Button variant="destructive" @click="confirmDelete">
          {{ t('sidebar.delete') }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <!-- Rename Dialog -->
  <Dialog v-model:open="showRenameDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('sidebar.renameConversation') }}</DialogTitle>
      </DialogHeader>
      <div class="py-4">
        <Input
          v-model="newConversationName"
          :placeholder="t('sidebar.conversationName')"
          @keyup.enter="confirmRename"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showRenameDialog = false">
          {{ t('sidebar.cancel') }}
        </Button>
        <Button @click="confirmRename">
          {{ t('sidebar.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
