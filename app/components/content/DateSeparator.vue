<script>
</script>

<script setup>
import { computed } from 'vue'
import { Separator, useForwardProps } from 'reka-ui'
import { reactivePick } from '@vueuse/core'
import { tv } from 'tailwind-variants'
import { useAppConfig } from '#imports'
import theme from '#build/ui/separator'

const props = defineProps({
  as: { type: null, required: false },
  label: { type: String, required: false },
  icon: { type: String, required: false },
  avatar: { type: Object, required: false },
  color: { type: null, required: false },
  size: { type: null, required: false },
  type: { type: null, required: false },
  orientation: { type: null, required: false, default: 'horizontal' },
  class: { type: null, required: false },
  ui: { type: null, required: false },
  decorative: { type: Boolean, required: false }
})
const slots = defineSlots()
const appConfig = useAppConfig()
const rootProps = useForwardProps(reactivePick(props, 'as', 'decorative', 'orientation'))
const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.separator || {} })({
  color: props.color,
  orientation: props.orientation,
  size: props.size,
  type: props.type
}))
</script>

<template>
  <Separator
    v-bind="rootProps"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <div
      :class="[
        ui.border({ class: props.ui?.border }),
        {
          'max-w-2': label || icon || avatar || !!slots.default
        }
      ]"
    />

    <template v-if="label || icon || avatar || !!slots.default">
      <div
        :class="ui.container({ class: props.ui?.container })"
        class="text-muted"
      >
        <slot>
          <span
            v-if="label"
            :class="ui.label({ class: props.ui?.label })"
          >{{ label }}</span>
          <UIcon
            v-else-if="icon"
            :name="icon"
            :class="ui.icon({ class: props.ui?.icon })"
          />
          <UAvatar
            v-else-if="avatar"
            :size="props.ui?.avatarSize || ui.avatarSize()"
            v-bind="avatar"
            :class="ui.avatar({ class: props.ui?.avatar })"
          />
        </slot>
      </div>

      <div :class="ui.border({ class: props.ui?.border })" />
    </template>
  </Separator>
</template>
