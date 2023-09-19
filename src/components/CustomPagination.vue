<template>
  <ul class="pagination justify-content-center">

    <li v-for="page in pageCount" :key="page" class="page-item" :class="{ active: currentPage === page }">
      <button class="page-link" @click="changePage(page)">{{ page }}</button>
    </li>

  </ul>
</template>

<script>
export default {
  props: {
    currentPage: Number,
    pageCount: Number,
  },
  methods: {
    changePage(newPage) {
      if (newPage < 1 || newPage > this.pageCount || newPage === this.currentPage) {
        return;
      }
      this.$emit('page-change', newPage);
    },
    nextPage() {
      const nextPage = this.currentPage + 1;
      if (nextPage <= this.pageCount) {
        this.$emit('page-change', nextPage);
      }
    },
    previousPage() {
      const previousPage = this.currentPage - 1;
      if (previousPage >= 1) {
        this.$emit('page-change', previousPage);
      }
    },
  },
};
</script>
