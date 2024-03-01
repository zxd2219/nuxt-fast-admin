<script lang="tsx">
export default defineComponent({
  name: "VNode",
  props: {
    node: {
      type: Object as PropType<string | VNode>,
      required: true,
    },
  },
  render() {
    return this.node;
  },
});
</script>
