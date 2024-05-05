<template>
  <h1 class="text-3xl text-center font-bold uppercase mt-4" style="color: var(--va-primary)">Risk Assessment Form</h1>
  <div class="flex justify-center m-2">
    <VaForm ref="formRef" class="flex flex-col w-full gap-6">
      <VaDateInput v-model="form.date" label="Date" clearable leftIcon />

      <VaInput
        requiredMark
        clearable
        v-model="form.title"
        :rules="[(value) => (value && value.length > 0) || '*Required']"
        label="Title of the Experiment / Task"
        placeholder="Example: To draw 1mL of solution into an empty disposable transfer pipet"
      />
      <VaTextarea
        autosize
        style="min-height: 10rem"
        requiredMark
        v-model="form.procedure"
        :rules="[(value) => (value && value.length > 0) || '*Required']"
        label="Outline of the procedure"
        placeholder="Example:
1. Squeeze the bulb to remove some air from the transfer pipet.
2. Submerge the tip of the transfer pipet in the solution.
3. Slowly release the pressure on the bulb and draw solution to the 1mL mark."
      />

      <VaInput
        clearable
        v-model="form.hazardousThings"
        @input="addHazardSelection()"
        label="Hazardous substances/procedures/equipments"
        placeholder="e.g. chemicals, microorganisms (keywords separate by comma ,)"
      />
      <template v-if="screenSize > 390">
        <VaSplit maximization disabled v-if="form.hazardousThings">
          <template #start v-if="hazards.length > 0 && hazards[0] != ''">
            <template v-for="(val, idx) in hazards" :key="idx">
              <div class="flex flex-col justify-center m-2">
                <VaSelect
                  v-model="form.hazardsSelection[idx]"
                  :label="`Nature of the hazards for ${val}`"
                  :options="hazardOptions"
                  multiple
                >
                  <template #content="{ value }">
                    <VaChip
                      v-for="chip in value"
                      :key="chip"
                      size="small"
                      class="mr-1 my-1 p-1"
                      closeable
                      @update:modelValue="deleteChip(chip, idx)"
                    >
                      {{ chip }}
                    </VaChip>
                  </template>
                </VaSelect>
              </div>
            </template>
          </template>
          <template #end>
            <div class="flex flex-col m-4">
              <p class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer primaryColor">
                Control measures and precautions
              </p>
              <VaOptionList
                v-model="form.precautions"
                :options="[
                  'Reduce scale',
                  'Use fume cupboard',
                  'Use safety screen',
                  'Wear protective gloves',
                  'Wear safety spectacles',
                  'Keep the flammable reagent away from naked flame',
                ]"
              />
              <template v-for="n in form.precautionsOtherCount" :key="n">
                <VaInput
                  class="mt-2"
                  :label="n == 1 ? 'Others' : ''"
                  v-model="form.precautionsOther[n - 1]"
                  :placeholder="`Other ${n}`"
                />
              </template>

              <VaButton size="small" class="mt-2 w-20" @click="form.precautionsOtherCount++ && handleOthers()">
                Add Others
              </VaButton>
            </div>
          </template>
        </VaSplit>
      </template>
      <div>
        <p class="va-input-label va-input-wrapper__label va-input-wrapper__label--outer primaryColor">
          Source of information(s)
        </p>
        <VaOptionList
          class="mt-0 flex flex-wrap"
          v-model="form.sources"
          type="switch"
          :options="['Handbook on Safety in Science Laboratories', 'MSDSs', 'Hazcards']"
        />
      </div>

      <VaInput
        clearable
        v-model="form.disposal"
        :rules="[(value) => (value && value.length > 0) || '*Required']"
        label="Disposal of residues:"
      />
      <VaInput
        clearable
        v-model="form.remarks"
        :rules="[(value) => (value && value.length > 0) || '*Required']"
        label="Remarks"
      />

      <template class="mt-8 flex w-full gap-1 background-element">
        <VaButton :disabled="!isValid" @click="validate() && submit()"> Submit </VaButton>
        <VaButton @click="reset"> Reset </VaButton>
      </template>
    </VaForm>
  </div>
</template>

<script setup>
  import { useForm } from 'vuestic-ui'
  import { ref, computed, watch, onMounted } from 'vue'
  const screenSize = computed(() => window.screen.width)

  const hazardModal = ref(false)
  const { isValid, validate, resetValidation } = useForm('formRef')
  const reset = () => {
    Object.keys(form.value).forEach((key) => {
      if (key == 'date') {
        form.value[key] = new Date()
      } else if (key == 'hazardsSelection') {
        Object.keys(form.value[key]).forEach((x) => {
          form.value[key][x] = []
        })
      } else {
        form.value[key] = ''
      }
    })
    resetValidation()
  }

  const form = ref({
    title: '',
    procedure: '',
    hazardousThings: '',
    hazardsSelection: {},
    precautions: [],
    date: new Date(),
    sources: [],
    disposal: '',
    remarks: '',
    precautionsOther: new Array(),
    precautionsOtherCount: 1,
  })

  const submit = () => {
    alert('Form submitted!')
    reset()
  }

  const hazards = computed(() => {
    let result = form.value.hazardousThings.trimStart().trimEnd()

    if (result && result.includes(',')) {
      result = result.split(',').filter((element) => {
        if (element) {
          if (element == ' ') {
            return false
          }
          return true
        }
      })
      return result
    }
    return [result]
  })

  const hazardOptions = [
    'Flammable',
    'Corrosive',
    'Irritant',
    'Toxic',
    'Harmful',
    'Explosive',
    'Scalds',
    'Potentially infectious',
    'Cut',
    'Others',
  ]

  const addHazardSelection = () => {
    if (hazards.value) {
      for (let i = 0; i < hazards.value.length; i++) {
        if (!form.value.hazardsSelection[i]) {
          form.value.hazardsSelection[i] = new Array()
        }
      }
    }
  }
  const deleteChip = (chip, idx) => {
    form.value.hazardsSelection[idx] = form.value.hazardsSelection[idx].filter((v) => v !== chip)
  }

  const handleOthers = () => {
    for (let i = 0; i < form.value.precautionsOtherCount; i++) {
      if (!form.value.precautionsOther[i]) {
        form.value.precautionsOther[i] = ''
      }
    }
  }

  watch(form.value.hazardsSelection, (newValue) => {
    //console.log(newValue) // [0: []; 1:[]]
    Object.entries(newValue).forEach((val, idx) => {
      console.log(`${form.value.hazardousThings.split(',')[idx]}`)
      console.log(`${(val, idx)}`)
    })
  })
</script>

<style scoped>
  .primaryColor {
    color: var(--va-primary);
  }
</style>
