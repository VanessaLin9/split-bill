import { ref } from 'vue'

export function useMembers() {
  const members = ref(JSON.parse(localStorage.getItem('members') || '["企鵝", "熊熊", "查德"]'))
  const newMember = ref('')

  const addMember = () => {
    if (newMember.value.trim() && !members.value.includes(newMember.value)) {
      members.value.push(newMember.value.trim())
      localStorage.setItem('members', JSON.stringify(members.value))
      newMember.value = ''
    }
  }

  const removeMember = (target, expenses = []) => {
    const isUsed = expenses.some(e =>
      e.paidBy === target || e.sharedWith.includes(target)
    )
    if (isUsed) {
      alert(`無法刪除「${target}」，因為已經在記帳紀錄中出現過。`)
      return
    }
    members.value = members.value.filter(m => m !== target)
    localStorage.setItem('members', JSON.stringify(members.value))
  }

  return {
    members,
    newMember,
    addMember,
    removeMember,
  }
}
