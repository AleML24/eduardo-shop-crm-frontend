<script setup>
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'
import {
  EditorContent,
  useEditor,
} from '@tiptap/vue-3'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
  },
  isDivider: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: [
        'heading',
        'paragraph',
      ],
    }),
    Placeholder.configure({ placeholder: props.placeholder ?? 'Write something here...' }),
    Underline,
  ],
  onUpdate() {
    if (!editor.value)
      return
    emit('update:modelValue', editor.value.getHTML())
  },
})

watch(() => props.modelValue, () => {
  const isSame = editor.value?.getHTML() === props.modelValue
  if (isSame)
    return
  editor.value?.commands.setContent(props.modelValue)
})
</script>

<template>
  <div>
    <div
      v-if="editor"
      class="d-flex gap-2 px-6 py-2 flex-wrap align-center editor"
    >
      <VBtn
        :class="{ 'is-active': editor.isActive('bold') }"
        icon="ri-bold"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <VBtn
        :class="{ 'is-active': editor.isActive('underline') }"
        icon="ri-underline"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        @click="editor.commands.toggleUnderline()"
      />
      <VBtn
        icon="ri-italic"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        :class="{ 'is-active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <VBtn
        icon="ri-strikethrough"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        :class="{ 'is-active': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      />
      <VBtn
        icon="ri-align-left"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        @click="editor.chain().focus().setTextAlign('left').run()"
      />
      <VBtn
        icon="ri-align-center"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        @click="editor.chain().focus().setTextAlign('center').run()"
      />
      <VBtn
        icon="ri-align-right"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        @click="editor.chain().focus().setTextAlign('right').run()"
      />
      <VBtn
        icon="ri-align-justify"
        class="rounded"
        size="small"
        variant="text"
        color="default"
        :class="{ 'is-active': editor.isActive({ textAlign: 'justify' }) }"
        @click="editor.chain().focus().setTextAlign('justify').run()"
      />
    </div>

    <VDivider v-if="props.isDivider" />

    <EditorContent
      ref="editorRef"
      :editor="editor"
    />
  </div>
</template>

<style lang="scss">
.ProseMirror {
  padding: 0.5rem;
  min-block-size: 15vh;
  outline: none;

  p {
    margin-block-end: 0;
  }

  p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}
</style>

<style lang="scss">
.is-active {
  border-color: rgba(var(--v-theme-primary), var(--v-border-opacity)) !important;
  background-color: rgba(var(--v-theme-primary), var(--v-activated-opacity));
  color: rgb(var(--v-theme-primary));
}
</style>
