import { createRouter, createWebHistory } from 'vue-router'
import { getAccount } from '@wagmi/core'
import { config } from '@/config/wagmi'
import HomeView from '@/views/HomeView.vue'
import CreatePlanView from '@/views/CreatePlanView.vue'
import EditPlanView from '@/views/EditPlanView.vue'
import PlanView from '@/views/PlanView.vue'
import DelegateView from '@/views/DelegateView.vue'
import MySubscriptionsView from '@/views/MySubscriptionsView.vue'
import { checkIsDelegated } from '@/composables/useEip7702'
import { checkIsAdmin } from '@/api/admin'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/delegate',
      name: 'delegate',
      component: DelegateView,
    },
    {
      path: '/create-plan',
      name: 'create-plan',
      component: CreatePlanView,
    },
    {
      path: '/plan/:id/edit',
      name: 'edit-plan',
      component: EditPlanView,
    },
    {
      path: '/plan/:slug',
      name: 'plan',
      component: PlanView,
    },
    {
      path: '/my-subscriptions',
      name: 'my-subscriptions',
      component: MySubscriptionsView,
    },
  ],
})

const protectedRoutes = ['create-plan', 'edit-plan', 'plan', 'my-subscriptions']
const adminRoutes = ['create-plan', 'edit-plan']

router.beforeEach(async (to, from, next) => {
  const account = getAccount(config)

  if (protectedRoutes.includes(to.name as string)) {
    if (!account.isConnected || !account.address || account.chainId == null) {
      next({ name: 'home' })
      return
    }
    const delegated = await checkIsDelegated(config, account.address, account.chainId)
    if (!delegated) {
      next({ name: 'delegate' })
      return
    }
    if (adminRoutes.includes(to.name as string)) {
      const admin = await checkIsAdmin(account.address)
      if (!admin) {
        next({ name: 'home' })
        return
      }
    }
  }

  if (to.name === 'home' && account.isConnected) {
    if (account.address && account.chainId != null) {
      const delegated = await checkIsDelegated(config, account.address, account.chainId)
      if (!delegated) {
        next({ name: 'delegate' })
        return
      }
    }
  }

  next()
})

export default router
